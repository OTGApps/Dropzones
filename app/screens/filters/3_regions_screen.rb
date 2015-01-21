class RegionsScreen < MasterTableScreen
  status_bar :light

  def will_appear
    self.title = "Dropzones by Region"
  end

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
        section_index = promotion_table_data.sections.index{|s| s[:title].split(' (').first.delete(" ").downcase.to_sym == territory}

        scrollIndexPath = NSIndexPath.indexPathForRow(0, inSection:section_index)
        table_view.scrollToRowAtIndexPath(scrollIndexPath, atScrollPosition:UITableViewScrollPositionTop, animated:true)

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
      central: '#CB996A',
      eastern: '#CA6768',
      gulf: '#3669C9',
      :"mid-atlantic" => '#16981B',
      mideastern: '#FDFD38',
      mountain: '#179867',
      northcentral: '#FD9828',
      northeast: '#CA0B15',
      northwest: '#9ACA28',
      pacific: '#983897',
      southeast: '#199ACA',
      southern: '#973436',
      southwest: '#FC3A99',
      western: '#FC0F3B',
      # TODO - Add territories
    }
  end

  def table_data
    @table_data ||= table_format(GeoJSON.sharedData.by_region)
  end

end
