class NearMeScreen < MasterTableScreen
  title "Dropzones Near Me"
  refreshable

  def on_refresh ; refresh ; end
  def on_appear ; refresh ; end

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
