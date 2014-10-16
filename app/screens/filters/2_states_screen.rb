class StatesScreen < MasterTableScreen
  searchable
  title "Dropzones by State"

  def table_data
    table_format(GeoJSON.sharedData.by_state)
  end
end
