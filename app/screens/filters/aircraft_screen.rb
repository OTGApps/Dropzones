class AircraftScreen < MasterTableScreen
  title "Dropzones by Aircraft"

  def on_load
  end

  def will_appear
  end

  def table_data
    [{cells:cells}]
  end

  def cells
    GeoJSON.sharedData.aircraft.map do |a|
      {
        title: a,
        action: :show_dzs,
        accessory_type: :disclosure_indicator,
        arguments: {
          aircraft: a
        }
      }
    end
  end

  def show_dzs(args={})
    mp args
    open AircraftDetailScreen.new(aircraft_name: args[:aircraft])
  end
end
