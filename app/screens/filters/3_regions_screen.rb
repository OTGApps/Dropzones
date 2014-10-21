class RegionsScreen < MasterTableScreen
  title "Dropzones by Region"

  def table_header_view
    image = UIImage.imageNamed('regions')
    @image_view = UIImageView.alloc.initWithFrame(CGRectMake(0, 0, 320, 202))
    @image_view.contentMode = UIViewContentModeScaleAspectFit
    @image_view.image = image
    @image_view.setUserInteractionEnabled(true)

    tapRecognizer = UITapGestureRecognizer.alloc.initWithTarget(self, action:"tapGesture:")
    @image_view.addGestureRecognizer(tapRecognizer)

    @image_view
  end

  def tapGesture(recognizer)
    point = recognizer.locationInView(@image_view)
    color = @image_view.colorAtPoint(point)

    colors.each do |territory, t_color|
      if isEqualToColor(color, color2:t_color.to_color, withTolerance:0.1)
        puts territory
        break
      end
    end
  end

  def isEqualToColor(color1, color2: color2, withTolerance:tolerance)
    components1 = CGColorGetComponents(color1.CGColor);
    components2 = CGColorGetComponents(color2.CGColor);

    (components1[0] - components2[0]).abs <= tolerance &&
    (components1[1] - components2[1]).abs <= tolerance &&
    (components1[2] - components2[2]).abs <= tolerance &&
    (components1[3] - components2[3]).abs <= tolerance
  end

  def colors
    {
      midatlantic: '#16981B',
      northcentral: '#FD9828',
      central: '#CB996A',
      eastern: '#CA6768',
      mideastern: '#FDFD38',
      gulf: '#3669C9',
      southwestern: '#FC3A99',
      southern: '#973436',
      southeast: '#199ACA',
      northeast: '#CA0B15',
      western: '#FC0F3B',
      northwest: '#9ACA28',
      mountain: '#179867',
      pacific: '#983897'
    }
  end

  def table_data
    table_format(GeoJSON.sharedData.by_region)
  end

end
