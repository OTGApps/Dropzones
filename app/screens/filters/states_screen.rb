class StatesScreen < MasterTableScreen
  searchable
  title "Dropzones by State"

  def on_load
  end

  def will_appear
  end

  def table_data
    table_format(GeoJSON.sharedData.by_state)
  end
end
