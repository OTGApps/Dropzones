class GeoJSON
  def self.sharedData
    Dispatch.once { @instance ||= new }
    @instance
  end

  def initialize
    json
  end

  def by_region
    @regions ||= json.group_by{ |obj| obj['properties']['region'] }
  end

  def by_state
    @states ||= json.group_by{ |obj| States.state(state(obj)) }
  end

  def by_attribute(att, search)
    json.select{ |dz|
      !dz['properties'][att].nil? && dz['properties'][att].find{ |ac|
        mp ac
        ac.squeeze(' ').match(search)
      }
    }.sort_by{|dz| dz['properties']['name'] }
  end

  def find_dz(anchor)
    @dzs ||= {}
    @dzs[anchor] ||= json.find{|dz| dz['properties']['anchor'] == anchor.to_s }
  end

  def json
    @j_data ||= BW::JSON.parse(File.read(location))
    @j_data['features']
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

  def sorted_by_distance_from(coordinate, &block)
    coordinate = CLLocation.alloc.initWithLatitude(coordinate[:lat], longitude:coordinate[:lon]) unless coordinate.is_a?(CLLocation)

    # Get their distnaces
    dzs_with_distance = json.map do |dz|
      dz_coord = CLLocation.alloc.initWithLatitude(dz['geometry']['coordinates'].last, longitude:dz['geometry']['coordinates'].first)
      distance = coordinate.distanceFromLocation(dz_coord)
      dz[:current_distance] = Distance.new(distance) # In Meters
      dz
    end

    block.call(dzs_with_distance.sort_by { |dz| dz[:current_distance] })
  end

  private

  def location
    @location ||= File.join(App.resources_path, "dropzones.geojson")
  end

end
