class FiltersScreen < PM::TableScreen
  # searchable
  title "Filter Dropzones"
  tab_bar_item title: "Filters", item: "filter"

  def on_load
  end

  def table_data
  [{
    title: nil,
    cells: [{
      title: "Near Me",
      subtitle: "Find the DZs closest to you right now!"
    }, {
      title: "By State",
      subtitle: "All the DZs nicely organized by state."
    }, {
      title: "Aircraft Type",
      subtitle: "Looking to jump a specific aircraft?"
    }, {
      title: "Training Capabilities",
      subtitle: "Tool cool for AFF and want to try static line?"
    },{
      title: "Facilities",
      subtitle: "Make sure the DZ has what you're looking for."
    }]
  }]
  end
end
