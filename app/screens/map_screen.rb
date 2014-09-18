class MapScreen < PM::MapScreen
  title "All Dropzones"
  tab_bar_item title: "Map", item: "map"

  def on_appear
    update_annotation_data
    zoom_to_fit_annotations
  end

  def annotation_data
    GeoJSON.sharedData.map_annotations
  end
end
