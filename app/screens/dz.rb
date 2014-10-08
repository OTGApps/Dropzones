class DZ < PM::Screen
  attr_accessor :anchor

  def on_load
    rmq.stylesheet = DZStylesheet

    @info = DZInfoScreen.new(
      detector_types: :all,
      external_links: true,
      dz: dz
    )
    @map = DZMapScreen.new
    @map.type = MKMapTypeHybrid
    @map.add_annotation({
      longitude: dz['geometry']['coordinates'].first,
      latitude: dz['geometry']['coordinates'].last,
      title: 'DZ'
    })
  end

  def will_appear
    @view_setup ||= self.set_up_view
    @map.zoom_to_marker
  end

  def set_up_view
    view.backgroundColor = UIColor.whiteColor

    rmq.append(@info.view, :info_view).layout('a0:a9')
    rmq.append(@map.view, :map_view).layout('a10:a17')

    true
  end

  def dz
    @dz ||= GeoJSON.sharedData.find_dz(@anchor)
  end
end
