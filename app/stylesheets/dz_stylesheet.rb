class DZStylesheet < ApplicationStylesheet

  def setup
    self.grid = RubyMotionQuery::Grid.new({
      content_left_margin: 0,
      content_right_margin: 0,
      content_top_margin: 0,
      content_bottom_margin: 0,
      num_columns: 1,
      column_gutter: 10,
      num_rows: 16,
      row_gutter: 0
    })
  end

  def map_view(st)
  end

  def info_view(st)
  end
end
