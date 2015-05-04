class ServicesScreen < MasterTableScreen
  status_bar :light
  title "Services Offered"

  def on_appear
    Flurry.logEvent("VIEW_SERVICES") unless Device.simulator?
  end

  def table_data
    [{cells:cells}]
  end

  def cells
    GeoJSON.sharedData.unique_attribute('services').map do |a|
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

  def show_dzs(args = {})
    open FilterDetailScreen.new(search: args[:search], attribute: 'services')
  end
end
