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

  app.device_family = [:iphone, :ipad]
  app.interface_orientations = [:portrait, :landscape_left, :landscape_right, :portrait_upside_down]

  app.identifier = 'io.otgapps.dropzones'
  app.version =  (`git rev-list HEAD --count`.strip.to_i).to_s
  app.short_version = '2.2.1'
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
  app.info_plist["UIRequiresFullScreen"] = true
  app.entitlements["beta-reports-active"] = true

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

  app.vendor_project('vendor/SHPAddressUtils', :static, cflags: "-fobjc-arc")

  app.development do
    app.entitlements['get-task-allow'] = true
    app.codesign_certificate = "iPhone Developer: Mark Rickert (YA2VZGDX4S)"
    app.provisioning_profile = "./provisioning/development.mobileprovision"
  end

  app.release do
    app.info_plist['AppStoreRelease'] = true
    app.seed_id = 'DW9QQZR4ZL'
    app.entitlements['get-task-allow'] = false
    app.codesign_certificate = "iPhone Distribution: Mohawk Apps, LLC (DW9QQZR4ZL)"
    app.provisioning_profile = "./provisioning/release.mobileprovision"
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


def build_path
  "build/iPhoneOS-7.1-Release/"
end

def ipa_name
  "\"#{Motion::Project::App.config.name}.ipa\""
end

def dsym_name
  "\"#{Motion::Project::App.config.name}.app.dSYM\""
end

after :"archive:distribution" do
  dsym_zip = "#{dsym_name}.zip"
  dsym_zip_path = File.join(build_path, dsym_zip)

  puts "Removing old DSYM..."
  sh "rm -f #{dsym_zip_path}"

  puts "Zipping DSYM..."
  sh "zip -r #{dsym_zip_path} #{File.join(build_path, dsym_name)}"

  config = YAML.load_file("config/crittercism.yml")
  app_id = config['crittercism']['app_id']
  api_key = config['crittercism']['api_key']

  puts "Uploading DSYM..."
  sh_cmd = <<-CMD
curl -F dsym=@"#{dsym_zip_path}" -F key="#{api_key}" \
"https://api.crittercism.com/api_beta/dsym/#{app_id}"
  CMD

  puts "Running: #{sh_cmd}"

  sh sh_cmd
end
