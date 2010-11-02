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
