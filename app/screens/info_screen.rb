class InfoScreen < PM::GroupedTableScreen
  title "About #{App.name}"

  def on_load
    set_nav_bar_button :right, {
      system_item: :stop,
      action: :close
    }
  end

  def on_appear
    # Flurry.logEvent("VIEW_INFO") unless Device.simulator?
  end

  def table_data
    [{
      title: "About:",
      cells: [{
        title: "Version",
        subtitle: App.info_plist['CFBundleShortVersionString'],
        cell_style: UITableViewCellStyleValue1
      },{
        title: "Copyright",
        subtitle: "© 2015-2018 Off The Grid Apps, LLC",
        cell_style: UITableViewCellStyleValue1
      },{
        title: "Visit otgapps.io",
        accessory_type: :disclosure_indicator,
        action: :visit,
        arguments: {
          url: 'http://otgapps.io'
        },
      }],
    }, {
      title: "Tell Your Friends:",
      cells: [{
        title: "Share the app",
        subtitle: "Text, Email, Tweet, or Facebook!",
        accessory_type: :disclosure_indicator,
        action: :share,
      # },{
      #   title: "Rate #{App.name} on iTunes",
      #   accessory_type: :disclosure_indicator,
      #   action: :rate,
      }]
    }, {
      title: "#{App.name} is open source!",
      cells: [{
        title: "View on Github",
        accessory_type: :disclosure_indicator,
        action: :visit,
        arguments: {
          url: 'https://github.com/OTGApps/dropzones'
        }
      },{
        title: "Found a bug?",
        subtitle: "Log it here",
        accessory_type: :disclosure_indicator,
        action: :visit,
        arguments: {
          url: 'https://github.com/OTGApps/dropzones/issues'
        }
      }]
    }]
  end

  def visit(args = {})
    App.open_url(args[:url])
  end

  def share
    share_text = "Check out this awesome app to find skydiving dropzones in your area! https://itunes.apple.com/us/app/dropzones-uspa-dropzone-finder/id960515397?mt=8&uo=4&at=10l4yY&ct=sharesheet"
    activity_vc = UIActivityViewController.alloc.initWithActivityItems([share_text], applicationActivities:nil)
    activity_vc.modalTransitionStyle = UIModalTransitionStyleCoverVertical

    open_modal activity_vc
  end

  # def rate
  #   Appirater.rateApp
  # end
end
