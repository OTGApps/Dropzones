# -*- coding: utf-8 -*-
$:.unshift("/Library/RubyMotion/lib")
$:.unshift("~/.rubymotion/rubymotion-templates")
require 'motion/project/template/ios'

begin
  require 'bundler'
  Bundler.require
rescue LoadError
end

Motion::Project::App.setup do |app|
  # Use `rake config' to see complete project settings.
  app.name = 'Dropzones'

  app.deployment_target = '10.0'

  app.device_family = [:iphone, :ipad]
  app.interface_orientations = [:portrait, :landscape_left, :landscape_right, :portrait_upside_down]

  app.identifier = 'io.otgapps.dropzones'
  app.version =  (`git rev-list HEAD --count`.strip.to_i).to_s
  app.short_version = '2.5.0'
  app.info_plist['APP_STORE_ID'] = 960515397
  app.info_plist['ITSAppUsesNonExemptEncryption'] = false
  app.resources_dirs << ['resources/flags']

  app.info_plist['CFBundleIcons'] = {
    'CFBundlePrimaryIcon' => {
      'CFBundleIconName' => 'AppIcon',
      'CFBundleIconFiles' => ['AppIcon60x60']
    }
  }
  app.info_plist['CFBundleIcons~ipad'] = {
    'CFBundlePrimaryIcon' => {
      'CFBundleIconName' => 'AppIcon',
      'CFBundleIconFiles' => ['AppIcon60x60', 'AppIcon76x76']
    }
  }

  # Location Services
  app.info_plist['NSLocationAlwaysUsageDescription'] = 'Helps locate dropzones near you.'
  app.info_plist['NSLocationWhenInUseUsageDescription'] = app.info_plist['NSLocationAlwaysUsageDescription']

  app.info_plist["UIStatusBarHidden"] = true
  app.info_plist["UIRequiredDeviceCapabilities"] = {
    "location-services" => true,
    "gps" => true,
  }
  app.info_plist["UIRequiresFullScreen"] = true

  app.frameworks += [
    'SystemConfiguration'
  ]

  app.pods do
    pod 'OpenInChrome'
    pod 'BFNavigationBarDrawer'
  end

  app.vendor_project('vendor/SHPAddressUtils', :static, cflags: "-fobjc-arc")

  MotionProvisioning.output_path = '../provisioning'
  app.development do
    app.entitlements['get-task-allow'] = true

    app.codesign_certificate = MotionProvisioning.certificate(
      type: :development,
      platform: :ios)

    app.provisioning_profile = MotionProvisioning.profile(
      bundle_identifier: app.identifier,
      app_name: app.name,
      platform: :ios,
      type: :development)
  end

  app.release do
    app.entitlements['get-task-allow'] = false
    app.entitlements['beta-reports-active'] = true
    app.info_plist['AppStoreRelease'] = true

    app.codesign_certificate = MotionProvisioning.certificate(
      type: :distribution,
      platform: :ios)

    app.provisioning_profile = MotionProvisioning.profile(
      bundle_identifier: app.identifier,
      app_name: app.name,
      platform: :ios,
      type: :distribution)
  end

end

# before :"build:simulator", :"build:device", :"archive:distribution" do
#   puts "running prebuild"
#   file_path = 'resources/dropzones.geojson'
#   web_path = 'https://raw.githubusercontent.com/OTGApps/USPADropzones/master/dropzones.geojson'
#   require 'open-uri'
#   open(file_path, 'w+') do |file|
#     file << open(web_path).read
#   end
# end

# after :clean do
#   puts "Deleting Geojson file."
#   file_path = 'resources/dropzones.geojson'
#   File.delete(file_path) if File.exist?(file_path)
# end

