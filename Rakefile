require 'rake'
require 'rubygems'
require 'builder'
require 'crxmake'
require 'json'

desc 'build extension'
task :build do
  CrxMake.make(
  :ex_dir     => ".",
  :crx_output => "chrome_dict.crx",
  :ignoredir  => /\.git/
  )
end

desc 'install extension'
task :install => [:build] do
  system("chromium-browser  #{File.join(File.dirname(__FILE__),'chrome_dict.crx')}") || \
  system("chromium-bin #{File.join(File.dirname(__FILE__),'chrome_dict.crx')}") || \
  system("chromium #{File.join(File.dirname(__FILE__),'chrome_dict.crx')}")
end
