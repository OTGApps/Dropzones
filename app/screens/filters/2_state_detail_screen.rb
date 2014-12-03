class StateDetailScreen < MasterTableScreen
  attr_accessor :state_name, :state

  def on_load
    super
    @td = [{cells:[{title: "Loading..."}]}]
    self.title = state_name
  end

  def refresh
    # @td = table_format(GeoJSON.sharedData.by_state)
    # end_refreshing
    # update_table_data
  end

  def table_data
    [{
      cells: state.sort_by{|s| s['current_distance']}.map{|dz| dz_cell(dz)}
    }]
  end

  def dz_cell(dz)
    mp dz
    {
      title: dz['properties']['name'],
      subtitle: distance_away(dz)
    }
  end
end
