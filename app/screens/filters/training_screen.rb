class TrainingScreen < MasterTableScreen
  title "Dropzones by Training"

  def on_load
  end

  def will_appear
  end

  def table_data
    [{cells:cells}]
  end

  def cells
    GeoJSON.sharedData.unique_attribute('training').map do |a|
      {
        title: a,
        action: :show_dzs,
        accessory_type: :disclosure_indicator,
        arguments: {
          training: a
        }
      }
    end
  end

  def show_dzs(args={})
    open FilterDetailScreen.new(attribute_name: args[:training])
  end
end
