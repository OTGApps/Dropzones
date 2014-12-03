class StatesScreen < MasterTableScreen
  title "Dropzones by State"

  def on_appear ; load_data ; end

  def on_load
    super
    @td = [{cells:[{title: "Loading..."}]}]
  end

  def load_data
    @td = [{
      cells: state_names.map{ |name| state_cell(name) }
    }]
    update_table_data
  end

  def table_data
    @td
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
    {
      title: state,
      subtitle: "#{dz_count(state)} Drop Zones",
      accessory_type: :disclosure_indicator,
      action: :show_state,
      arguments: {
        state_name: state,
        state: by_state[state]
      }
    }
  end

  def show_state(args={})
    open StateDetailScreen.new(args)
  end

end
