class GeoJSON
  def self.sharedData
    Dispatch.once { @instance ||= new }
    @instance
  end

  def data_url
    'https://raw.githubusercontent.com/OTGApps/USPADropzones/master/dropzones.geojson'
  end

  def file_name
    "dropzones.geojson"
  end

  def documents_file
    file_name.document_path
  end

  def resources_file
    file_name.resource_path
  end

  def downloaded_file_exists?
    documents_file.file_exists?
  end

  def download_new_data(&block)
    mp "Initiating downloading of new data."
    # Only check for new data every 2 days (or 30 seconds if in the simulator)
    check_interval = Device.simulator? ? 30 : 172800
    if App::Persistence['last_data_check'].to_i < Time.now.to_i - check_interval
      mp 'Downloading new data file'
      AFMotion::HTTP.get(data_url) do |result|
        mp 'got result'
        if result.success?
          mp 'got successful result.'
          mp 'writing data to file.'
          result.object.write_to(documents_file)
          clear_cache!
          App::Persistence['last_data_check'] = Time.now
          block.call
        end
      end
    end
  end

  def initialize
    @location = nil
    json
  end

  def location=(l)
    mp "Setting location: #{l}"
    @location = l
  end

  def by_region
    # TODO - sort this alphabetically
    @regions ||= json.group_by{ |dz| dz['properties']['region'] }.each do |region, dzs|
      dzs.sort_by!{|dz| dz['properties']['name'] }
    end
  end

  def by_state
    @states ||= json.group_by{ |dz| States.state(state(dz)) }.each do |region, dzs|
      dzs.sort_by!{|dz| dz['properties']['name'] }
    end
  end

  def by_attribute(att, search)
    @by_att ||= {}
    @by_att["#{att}_#{search}"] ||= json.select{ |dz|
      !dz['properties'][att].nil? && dz['properties'][att].find{ |ac|
        ac.squeeze(' ').match(search)
      }
    }
  end

  def find_dz(anchor)
    @dzs ||= {}
    @dzs[anchor] ||= json.find{|dz| dz['properties']['anchor'] == anchor.to_s }
  end

  def json
    @j_data ||= BW::JSON.parse(File.read(file_location))

    if @location.nil? || (@location.is_a?(Hash) && @location.has_key?(:error))
      mp 'getting json without location'
      @sorted ||= @j_data['features'].sort_by{|dz| dz['properties']['name'] }
    else
      mp 'getting json with location'
      sorted_by_distance(@j_data['features'])
    end
  end

  def state(data)
    # Extract the state out of the location array
    mp data['properties']['location']
    c_s_z = data['properties']['location'].find{|l| (l =~ /^[\w\s.]+,\s\w{2}\s\d{5}(-\d{4})?$/) != nil }

    if c_s_z.nil?
      if data['properties']['location'].find{ |l| l == 'US Virgin Islands' }
        'US Virgin Islands'
      else
        'Unknown'
      end
    else
      c_s_z.split(' ')[-2]
    end
  end

  def unique_attribute(att)
    @unique ||= {}
    @unique[att] ||= json.map{ |dz|
      dz['properties'][att]
    }
    .flatten(1)
    .uniq
    .compact
    .map{|ac|
      (ac[1] == ' ') ? ac.split(' ')[1..-1].join(' ').singularize.squeeze(' ') : ac.squeeze(' ')
    }.uniq
    .sort
  end

  def sorted_by_distance(dzs)
    mp "location: "
    mp @location
    # Get their distnaces
    dzs_with_distance = dzs.map do |dz|
      dz_coord = CLLocation.alloc.initWithLatitude(dz['geometry']['coordinates'].last, longitude:dz['geometry']['coordinates'].first)
      distance = @location.distanceFromLocation(dz_coord)
      dz[:current_distance] = Distance.new(distance) # In Meters
      dz
    end

    # Sort by distance
    dzs_with_distance.sort_by { |dz| dz[:current_distance] }
  end

  def clear_cache!
    @regions = nil
    @states = nil
    @dzs = nil
    @j_data = nil
    @sorted = nil
    @unique = nil
    @by_att = nil
  end

  def file_location
    downloaded_file_exists? ? documents_file : resources_file
  end

end
