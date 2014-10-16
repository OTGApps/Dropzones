class StatesScreen < MasterTableScreen
  title "Dropzones by State"
  searchable
  refreshable

  def on_refresh ; refresh ; end
  def on_appear ; refresh ; end

  def on_load
    super
    @td = [{title:nil, cells:[{title: "Loading..."}]}]
  end

  def refresh
    @td = table_format(GeoJSON.sharedData.by_state)
    end_refreshing
    update_table_data
  end

  def table_data
    @td
  end
end
