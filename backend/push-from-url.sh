#!/usr/bin/env bash

# TODO ruby this whole boi

scripts_dir="$(cd "$(dirname "$0")" && pwd)"
if command -v cf > /dev/null 2>&1 ; then
  CF=cf
else
  CF="$scripts_dir/cf"
fi

if [ $# -lt 2 ]; then
  >&2 echo 'Usage ./push-from-url.sh url-to-push auth-token [cf push arguments]'
  exit 1
fi

url_to_push="$1"
auth_token="$2"
tmp_dir=$(mktemp -d)

echo Using "$tmp_dir"
cd "$tmp_dir" || exit 1
echo "Downloading $url_to_push"
curl --fail --silent --location "$url_to_push" --output app-to-push.zip

# Hack to force cf to create cf_home/config.json
$CF auth foo bar

ruby -r json ~/.cf/config.json <<RUBY
  puts "I am ruby"
  puts JSON.parse(File.read(ARGV[0])).inspect
RUBY

