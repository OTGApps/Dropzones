# -*- coding: utf-8 -*-
$:.unshift("/Library/RubyMotion/lib")
require 'motion/project/template/ios'
require 'motion-support/inflector'
require 'rake/hooks'
begin
  require 'bundler'
  Bundler.require
rescue LoadError
end

Motion::Project::App.setup do |app|
  # Use `rake config' to see complete project settings.
  app.name = 'Dropzones'

  app.deployment_target = '7.1'

  app.device_family = [:iphone]
  app.interface_orientations = [:portrait, :portrait_upside_down]

  app.identifier = 'io.otgapps.dropzones'
  app.version =  (`git rev-list HEAD --count`.strip.to_i).to_s
  app.short_version = '2.0.0'
  app.icons = Dir.glob("resources/Icon*.png").map{|icon| icon.split("/").last}
  app.prerendered_icon = true
  app.info_plist['APP_STORE_ID'] = 960515397
  app.resources_dirs << ['resources/flags']

  # Location Services
  app.info_plist['NSLocationAlwaysUsageDescription'] = 'Helps locate dropzones near you.'
  app.info_plist['NSLocationWhenInUseUsageDescription'] = app.info_plist['NSLocationAlwaysUsageDescription']

  app.info_plist["UIViewControllerBasedStatusBarAppearance"] = false
  app.info_plist["UIStatusBarHidden"] = true
  app.info_plist["UIRequiredDeviceCapabilities"] = {
    "location-services" => true,
    "gps" => true,
  }

  app.frameworks += [
    'SystemConfiguration'
  ]

  app.pods do
    pod 'OpenInChrome'
    pod 'CrittercismSDK'
    pod 'FlurrySDK', '~> 5.4'
    pod 'Appirater'
    pod 'BFNavigationBarDrawer'
  end

  app.vendor_project('vendor/UIImageColorAtPoint', :static, cflags: "-fobjc-arc")

  app.development do
    app.entitlements['get-task-allow'] = true
    app.codesign_certificate = "iPhone Developer: Mark Rickert (YA2VZGDX4S)"
    app.provisioning_profile = "../Provisioning/WildcardDevelopment.mobileprovision"
    # app.concat_files exclude: [ "/app/" ], parallel: 3
  end

  app.release do
    app.info_plist['AppStoreRelease'] = true
    app.seed_id = 'DW9QQZR4ZL'
    app.entitlements['get-task-allow'] = false
    app.codesign_certificate = "iPhone Distribution: Mohawk Apps, LLC (DW9QQZR4ZL)"
    app.provisioning_profile = "./provisioning/release.mobileprovision"
    # app.concat_files
  end

end

before :"build:simulator", :"build:device" do
  puts "running prebuild"
  file_path = 'resources/dropzones.geojson'
  web_path = 'https://raw.githubusercontent.com/OTGApps/USPADropzones/master/dropzones.geojson'
  unless File.exist?(file_path)
    require 'open-uri'
    open(file_path, 'wb') do |file|
      file << open(web_path).read
    end
  end
end

after :clean do
  puts "Deleting Geojson file."
  file_path = 'resources/dropzones.geojson'
  File.delete(file_path) if File.exist?(file_path)
end


desc "Run simulator on iPhone"
task :iphone4 do
    exec 'bundle exec rake device_name="iPhone 4s"'
end

desc "Run simulator on iPhone"
task :iphone5 do
    exec 'bundle exec rake device_name="iPhone 5"'
end

desc "Run simulator on iPhone"
task :iphone6 do
    exec 'bundle exec rake device_name="iPhone 6"'
end

desc "Run simulator on iPhone"
task :iphone6plus do
    exec 'bundle exec rake device_name="iPhone 6 Plus"'
end

desc "Run simulator in iPad Retina"
task :retina do
    exec 'bundle exec rake device_name="iPad Retina"'
end

desc "Run simulator on iPad Air"
task :ipad do
    exec 'bundle exec rake device_name="iPad Air"'
end
