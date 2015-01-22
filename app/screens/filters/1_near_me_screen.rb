class NearMeScreen < MasterTableScreen
  # refreshable
  status_bar :light
  title "Dropzones Near Me"

  # def on_refresh ; refresh ; end
  def on_appear ; refresh ; end

  def on_load
    super
    set_nav_bar_button :back, title: '', style: :plain, action: :back
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
