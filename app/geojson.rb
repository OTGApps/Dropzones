class GeoJSON
  def self.sharedData
    Dispatch.once { @instance ||= new }
    @instance
  end

  def initialize
    json
  end

  def by_region
    @regions ||= json.group_by { |obj| obj['properties']['region'] }
  end

  def by_state
    @states ||= json.group_by { |obj| States.state(state(obj)) }
  end

  def find_dz(anchor)
    @dzs ||= {}
    @dzs[anchor] ||= json.find{|dz| dz['properties']['anchor'] == anchor.to_s }
  end

  def json
    @j_data ||= BW::JSON.parse(File.read(location))
    @j_data['features']
  end

  private

  def location
    @location ||= File.join(App.resources_path, "dropzones.geojson")
  end

  def state(data)
    # Extract the state out of the location array
    mp data['properties']['location']
    c_s_z = data['properties']['location'].find{|l| (l =~ /^[\w\s.]+,\s\w{2}\s\d{5}(-\d{4})?$/) != nil }

    if c_s_z.nil?
      "Unknown"
    else
      c_s_z.split(' ')[-2]
    end
  end

end
