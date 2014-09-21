class AircraftDetailScreen < MasterTableScreen
  attr_accessor :aircraft_name

  def on_load
    mp 'onload'
  end

  def will_appear
    self.title = @aircraft_name
    mp 'willappear'
  end

  def table_data
    mp 'table_data'
    [{cells:dz_cells}]
  end

  def dz_cells
    mp "Aircraft: #{@aircraft_name}"
    GeoJSON.sharedData.by_aircraft(@aircraft_name).map do |a|
      {
        title: a['properties']['name'],
        action: :show_dzs,
        accessory_type: :disclosure_indicator,
        arguments: {
          anchor: dz['properties']['anchor']
        }
      }
    end
  end
end
