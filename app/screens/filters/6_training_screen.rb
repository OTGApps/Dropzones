class TrainingScreen < MasterTableScreen
  status_bar :light
  title "Dropzones by Training"

  def on_appear
    Flurry.logEvent("VIEW_TRAINING") unless Device.simulator?
  end

  def table_data
    [{cells:cells}]
  end

  def cells
    GeoJSON.sharedData.unique_attribute('training').map do |a|
      {
        title: a,
        subtitle: subtitle(a),
        action: :show_dzs,
        accessory_type: :disclosure_indicator,
        arguments: {
          search: a
        }
      }
    end
  end

  def subtitle(title)
    case title
    when "AFF"
      "Accelerated Free Fall"
    when "IAD"
      "Instructor Assisted Deployment"
    when "SL"
      "Static Line"
    end
  end

  def show_dzs(args = {})
    open FilterDetailScreen.new(search: args[:search], attribute: 'training')
  end
end
