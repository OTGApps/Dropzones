module OpenDZScreen
  def open_dz_screen(args = {})
     open DZDetailScreen.new(args.merge(
      external_links: true,
      detector_types: [:phone, :link, :address]
      )
    )
  end
end
