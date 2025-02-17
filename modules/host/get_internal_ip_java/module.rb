#
# Copyright (c) 2006-2025 Wade Alcorn - wade@bindshell.net
# Browser Exploitation Framework (BeEF) - https://beefproject.com
# See the file 'doc/COPYING' for copying permission
#
class Get_internal_ip_java < BeEF::Core::Command
  def pre_send
    BeEF::Core::NetworkStack::Handlers::AssetHandler.instance.bind('/modules/host/get_internal_ip_java/get_internal_ip.class', '/get_internal_ip', 'class')
  end

  # def self.options
  #  return [
  #      { 'name' => 'applet_name', 'description' => 'Applet Name', 'ui_label'=>'Number', 'value' =>'5551234','width' => '200px' },
  #  ]
  # end

  def post_execute
    content = {}
    content['Result'] = @datastore['result']
    save content
    BeEF::Core::NetworkStack::Handlers::AssetHandler.instance.unbind('/get_internal_ip.class')

    configuration = BeEF::Core::Configuration.instance
    return unless configuration.get('beef.extension.network.enable') == true

    session_id = @datastore['beefhook']

    # save the network host
    return unless @datastore['results'] =~ /^([\d.]+)$/

    ip = Regexp.last_match(1)
    if BeEF::Filters.is_valid_ip?(ip)
      print_debug("Hooked browser has network interface #{ip}")
      BeEF::Core::Models::NetworkHost.create(hooked_browser_id: session_id, ip: ip)
    end
  end
end
