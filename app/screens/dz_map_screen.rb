class DZMapScreen < PM::MapScreen

  def annotation_data
    []
  end

  def zoom_to_marker
    r = region(
      coordinate: annotations.first.coordinate,
      span: [0.08, 0.08]
    )
    set_region(r, false)
  end
end
