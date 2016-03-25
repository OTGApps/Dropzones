class GeoJSON
  def self.sharedData
    Dispatch.once { @instance ||= new }
    @instance
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
    @by_att["#{att}_#{search}"] ||= json.select do |dz|
      !dz['properties'][att].nil? && dz['properties'][att].find do |ac|
        if att == 'aircraft'
          ac == search || ac[2..-1] == search || ac[2..-2] == search
        else
          m = ac.match(search)
          m = ac == search if m.nil?
          m
        end
      end
    end
  end

  def favorites
    favs = App::Persistence[:flagged].select{|k,v| v == true}.keys
    json.select{|dz| favs.include?(dz['properties']['anchor'])}
  end

  def find_dz(anchor)
    @dzs ||= {}
    @dzs[anchor] ||= json.find{|dz| dz['properties']['anchor'] == anchor.to_s }
  end

  def json
    @j_data ||= BW::JSON.parse(File.read(resources_file))

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
    c_s_z = data['properties']['location'].find{|l| (l =~ /^[\w\s.]+,\s\w{2,20}\s\d{5}(-\d{4})?$/) != nil }

    if c_s_z.nil?
      if data['properties']['location'].find{ |l| l == 'US Virgin Islands' }
        'US Virgin Islands'
      elsif data['properties']['location'].find{ |l| l == 'Puerto Rico' }
        'Puerto Rico'
      else
        'International'
      end
    else
      result = c_s_z.split(' ')[-2]
      if result.length == 2
        result
      else
        States.all.key(result)
      end
    end
  end

  def unique_attribute(att)
    @unique ||= {}
    @unique[att] ||= json.map do |dz|
      dz['properties'][att]
    end.flatten(1)
    .uniq
    .compact
    .map do |ac|
      (ac =~ /[0-9]{1}\ .*/) ? ac[2..-1].singularize : ac
    end.uniq
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

  def file_name
    "dropzones.geojson"
  end

  def resources_file
    file_name.resource_path
  end

end
