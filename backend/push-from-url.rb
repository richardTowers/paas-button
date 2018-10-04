#!/usr/bin/env ruby
require 'json'
require 'open-uri'
require 'tmpdir'

if `uname -a`.include? 'Linux'
  puts 'Linux, so let us use our local cf binary'
  $cf = "#{__dir__}/cf_local"
else
  $cf = 'cf'
end

def download_application_zip(url)
  path = "app-to-push.zip"
  case io = open(url)
  when StringIO then File.open(path, 'wb') { |f| f.write(io.read) }
  when Tempfile then FileUtils.mv(io.path, path)
  end
  raise 'unzip failed' unless system "unzip #{path}"
  # Unzip will have created a directory, but we don't know what it will be called
  # Since we're in a temp dir we can just assume it's the only directory here:
  Dir.entries('.').select{|d| !d.start_with?('.') && Dir.exist?(d) }.first
end

def set_access_token(access_token, refresh_token)
  # Reset ~/.cf/config.json (or create it if it doesn't exist)
  raise 'failed to logout' unless system "#{$cf} logout 2>&1"

  config_path = "#{Dir.home}/.cf/config.json"
  config = JSON.parse(File.read(config_path))

  # TODO don't hardcode the target API
  config["Target"] = "https://api.towers.dev.cloudpipeline.digital"
  config["AccessToken"] = "bearer #{access_token}"
  config["RefreshToken"] = refresh_token
  config["UAAOAuthClient"] = 'paas-button'
  config["UAAOAuthClientSecret"] = ENV.fetch('PAAS_BUTTON_UAA_SECRET')

  File.open(config_path, 'w') do |file|
    file.write(JSON.pretty_generate(config))
  end
end

def push_app(app_path, org_name, space_name, app_name, github_url, args)
  Dir.chdir app_path do
    raise 'cf target failed' unless system "#{$cf} target  -o #{org_name} -s #{space_name}"
    raise 'cf push failed' unless system "#{$cf} push '#{app_name}' --no-start #{args.map{|a|"'#{a}'"}.join(' ')}"
    raise 'cf set-env failed' unless system "#{$cf} set-env '#{app_name}' PAAS_BUTTON_GITHUB_URL '#{github_url}'"
    raise 'cf start failed' unless system "#{$cf} start '#{app_name}'"
  end
end

def main()
  if ARGV.length < 6
    STDERR.puts 'Usage ./push-from-url.rb access_token refresh_token org_name space_name app_name url_to_download ...push_arguments'
    exit 1
  end

  Dir.mktmpdir "paas-button-backend" do |tmpdir|
    Dir.chdir tmpdir do
      set_access_token ARGV[0], ARGV[1]
      org_name = ARGV[2]
      space_name = ARGV[3]
      app_name = ARGV[4]
      github_url = ARGV[5].sub('/archive/master.zip', '')
      app_path = download_application_zip ARGV[5]
      puts tmpdir + '/' + app_path
      push_app(app_path, org_name, space_name, app_name, github_url, ARGV[6..-1])
    end
  end
end

main()
