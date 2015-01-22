class NearMeScreen < MasterTableScreen
  status_bar :light
  title "Dropzones Near Me"

  def on_appear
    Flurry.logEvent("VIEW_NEAR_ME") unless Device.simulator?
    refresh
  end

  def on_load
    super
    @dzs = [{title: "Loading..."}]
  end

  def refresh
    map_and_show_dzs
  end

  def table_data
    [{
      title: nil,
      cells: @dzs
    }]
  end
end
