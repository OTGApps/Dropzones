class GeoJSON
  def self.sharedData
    Dispatch.once { @instance ||= new }
    @instance
  end

  def initialize
    json
  end

  def by_region
    json.group_by { |obj| obj['properties']['region'] }
  end

  def find_dz(anchor)
    json.find{|dz| dz['properties']['anchor'] == anchor.to_s }
  end

  def json
    @j_data ||= BW::JSON.parse(File.read(location))
    @j_data['features']
  end

  private

  def location
    @location ||= File.join(App.resources_path, "dropzones.geojson")
  end

end
