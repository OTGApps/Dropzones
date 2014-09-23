class DropzonesScreen < MasterTableScreen
  searchable
  title "Dropzones"
  tab_bar_item title: "Dropzones", item: "airplane"

  def on_load
  end

  def will_appear
  end

  def table_data
    table_format(GeoJSON.sharedData.by_region)
  end

  def table_data_index
    @index_data ||= table_data.collect{ |section| section[:title].split(/[(]|[)]/).last }
  end

end
