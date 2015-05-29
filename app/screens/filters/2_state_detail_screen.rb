class StateDetailScreen < MasterTableScreen
  include OpenDZScreen
  status_bar :light
  attr_accessor :state_name, :state

  def will_appear
    Flurry.logEvent("VIEW_STATE_DETAIL", withParameters:{state: state_name}) unless Device.simulator?
    self.title = state_name
    super
  end

  def table_data
    [{
      cells: state.sort_by{|s| s['current_distance']}.map{ |dz| dz_cell(dz) }
    }]
  end

  def dz_cell(dz)
    {
      title: dz['properties']['name'],
      subtitle: distance_away(dz),
      action: :open_dz_screen,
      arguments: {
        anchor: dz['properties']['anchor']
      },
      accessory_type: :disclosure_indicator,
    }
  end
end
