class DZInfoScreen < PM::WebScreen
  attr_accessor :dz

  def content
    parsed_html
    evaluate "document.body.innerHTML += '<style>#{css}</style>'"
  end

  def parsed_html
    mp @dz
    html = File.read(File.join(App.resources_path, "dz_info.html"))

    html.tap do |h|
      h.sub!('[NAME]', @dz['properties']['name'])
      h.sub!('[WEBSITE]', 'test')
    end

    mp html
    html.to_s
  end

  def css
    File.read(File.join(App.resources_path, "style.css"))
  end
end
