class DropzonesScreen < PM::TableScreen
  # searchable
  title "Dropzones"
  tab_bar_item title: "Dropzones", item: "compass"


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
