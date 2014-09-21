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

  def by_aircraft(aircraft)
    json.select{ |dz|
      !dz['properties']['aircraft'].nil? && dz['properties']['aircraft'].find{ |ac|
        ac.match(aircraft)
      }
    }
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

  def aircraft
    @unique_aircraft ||= json.map{ |dz|
      dz['properties']['aircraft']
    }
    .flatten(1)
    .uniq
    .compact
    .map{|ac|
      (ac[1] == ' ' ) ? ac.split(' ')[1..-1].join(' ').singularize : ac
    }.uniq
    .sort
  end

  private

  def location
    @location ||= File.join(App.resources_path, "dropzones.geojson")
  end

end
