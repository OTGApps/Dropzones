class DZ < PM::Screen
  attr_accessor :data, :anchor

  def on_load
    view.backgroundColor = UIColor.whiteColor
    mp dz
  end

  def dz
    @dz ||= GeoJSON.sharedData.find_dz(@anchor)
  end
end
