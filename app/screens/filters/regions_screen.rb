class RegionsScreen < MasterTableScreen
  searchable
  title "Dropzones by Region"

  def table_data
    table_format(GeoJSON.sharedData.by_region)
  end

  def table_data_index
    @index_data ||= table_data.collect{ |section| section[:title].split(/[(]|[)]/).last }
  end

end
