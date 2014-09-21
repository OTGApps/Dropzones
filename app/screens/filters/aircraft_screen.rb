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
    GeoJSON.sharedData.unique_attribute('aircraft').map do |a|
      {
        title: a,
        action: :show_details,
        accessory_type: :disclosure_indicator,
        arguments: {
          aircraft: a
        }
      }
    end
  end

  def show_details(args={})
    open FilterDetailScreen.new(attribute_name: args[:aircraft])
  end
end
