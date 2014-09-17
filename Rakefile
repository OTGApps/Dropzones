# -*- coding: utf-8 -*-
$:.unshift("/Library/RubyMotion/lib")
require 'motion/project/template/ios'

begin
  require 'bundler'
  Bundler.require
rescue LoadError
end

Motion::Project::App.setup do |app|
  # Use `rake config' to see complete project settings.
  app.name = 'Dropzones'
  app.deployment_target = '7.0'
  app.device_family = [:iphone]
  app.interface_orientations = [:portrait, :portrait_upside_down]
  app.identifier = 'com.mohawkapps.dropzones'
  app.seed_id = 'DW9QQZR4ZL'
  app.version = '1'
  app.short_version = '1.0.0'
  app.icons = Dir.glob("resources/Icon*.png").map{|icon| icon.split("/").last}
  app.prerendered_icon = true
  # app.info_plist['APP_STORE_ID'] = 823834093

  app.entitlements['get-task-allow'] = true
  app.codesign_certificate = "iPhone Developer: Mark Rickert (YA2VZGDX4S)"
  app.provisioning_profile = "./provisioning/development.mobileprovision"

  app.pods do
    pod 'FlurrySDK'
    pod 'Appirater'
  end

  app.release do
    app.info_plist['AppStoreRelease'] = true
    app.entitlements['get-task-allow'] = false
    app.codesign_certificate = "iPhone Distribution: Mohawk Apps, LLC (DW9QQZR4ZL)"
    app.provisioning_profile = "./provisioning/release.mobileprovision"
  end

end
