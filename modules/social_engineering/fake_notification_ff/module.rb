#
# Copyright (c) 2006-2025 Wade Alcorn - wade@bindshell.net
# Browser Exploitation Framework (BeEF) - https://beefproject.com
# See the file 'doc/COPYING' for copying permission
#
class Fake_notification_ff < BeEF::Core::Command
  def self.options
    [
      { 'name' => 'url', 'ui_label' => 'Plugin URL', 'value' => '', 'width' => '150px' },
      { 'name' => 'notification_text',
        'description' => 'Text displayed in the notification bar',
        'ui_label' => 'Notification text',
        'value' => 'An additional plug-in is required to display some elements on this page.' }
    ]
  end

  def post_execute
    content = {}
    content['result'] = @datastore['result']
    save content
  end
end
