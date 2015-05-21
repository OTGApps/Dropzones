class NearMeScreen < MasterTableScreen
  status_bar :light
  title "Dropzones Near Me"

  def will_appear
    @reload_observer = App.notification_center.observe 'MotionConciergeNewDataReceived' do |notification|
      @dzs = nil
      map_and_show_dzs
    end
  end

  def on_appear
    Flurry.logEvent("VIEW_NEAR_ME") unless Device.simulator?
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
