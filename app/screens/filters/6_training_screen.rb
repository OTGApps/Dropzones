class TrainingScreen < MasterTableScreen
  status_bar :light
  title "Dropzones by Training"

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
          search: a
        }
      }
    end
  end

  def show_dzs(args={})
    open FilterDetailScreen.new(search: args[:search], attribute: 'training')
  end
end
