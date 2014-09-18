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

  def map_annotations
    @annotations ||= begin
      json.map do |dz|
        {
          longitude: dz['geometry']['coordinates'].first,
          latitude: dz['geometry']['coordinates'].last,
          title: dz['properties']['name'],
          subtitle: dz['properties']['location'].last
        }      end
    end
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

end
