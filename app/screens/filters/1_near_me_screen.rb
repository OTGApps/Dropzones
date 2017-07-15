class NearMeScreen < MasterTableScreen
  status_bar :light
  title "Dropzones Near Me"
  searchable hide_initially: true

  def on_appear
    # Flurry.logEvent("VIEW_NEAR_ME") unless Device.simulator?
    map_and_show_dzs
  end

  def table_data
    if @dzs
      [{
        cells: @dzs
      }]
    else
      loading_table_data
    end
  end
end
