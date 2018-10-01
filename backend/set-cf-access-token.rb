#!/usr/bin/env ruby
require 'json'

if ARGV.length != 1
  STDERR.puts 'Must provide an access token as a single argument'
  exit 1
end

config_path = "#{Dir.home}/.cf/config.json"
config = JSON.parse(File.read(config_path))

config["AccessToken"] = "bearer #{ARGV[0]}"

File.open(config_path, 'w') do |file|
  file.write(JSON.pretty_generate(config))
end
