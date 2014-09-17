class FiltersScreen < PM::TableScreen
  # searchable
  title "Filter Dropzones"
  tab_bar_item title: "Filters", item: "filter"

  def on_load
  end

  def will_appear
  end

  def table_data
  [{
    title: nil,
    cells: []
  }]
  end
end
