class StatesScreen < MasterTableScreen
  status_bar :light
  title "Dropzones by State"

  def will_appear
    @reload_observer = App.notification_center.observe 'MotionConciergeNewDataReceived' do |notification|
      set_loading
      @states = nil
      load_data
    end
  end

  def on_appear
    Flurry.logEvent("VIEW_STATES") unless Device.simulator?
    load_data
  end

  def will_disappear
    App.notification_center.unobserve @reload_observer
  end

  def load_data
    @td = [{
      cells: state_names.map{ |name| state_cell(name) }
    }]
    update_table_data
  end

  def table_data
    @td || loading_table_data
  end

  def by_state
    @states ||= GeoJSON.sharedData.by_state
  end

  def state_names
    by_state.keys.sort
  end

  def dz_count(state)
    by_state[state].count
  end

  def state_cell(state)
    count = dz_count(state)
    if count == 1
      sub = "#{dz_count(state)} Drop Zone"
    else
      sub = "#{dz_count(state)} Drop Zones"
    end

    {
      title: state,
      subtitle: sub,
      cell_identifier: state,
      accessory_type: :disclosure_indicator,
      action: :show_state,
      arguments: {
        state_name: state,
        state: by_state[state]
      }
    }
  end

  def show_state(args = {})
    open StateDetailScreen.new(args)
  end

end
