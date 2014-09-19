class DZ < PM::Screen
  attr_accessor :data

  def on_load
    mp @data
    view.backgroundColor = UIColor.whiteColor
  end
end
