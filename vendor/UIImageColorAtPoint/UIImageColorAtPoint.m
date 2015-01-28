#import "UIImageColorAtPoint.h"
#import <QuartzCore/QuartzCore.h>

@implementation UIView (ColorAtPoint)

-(UIColor *) colorAtPoint:(CGPoint)point
{
  unsigned char pixel[4] = {0};
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  CGContextRef context = CGBitmapContextCreate(pixel,
          1, 1, 8, 4, colorSpace, (CGBitmapInfo)kCGImageAlphaPremultipliedLast);

  CGContextTranslateCTM(context, -point.x, -point.y);

  [self.layer renderInContext:context];

  CGContextRelease(context);
  CGColorSpaceRelease(colorSpace);
  UIColor *color = [UIColor colorWithRed:pixel[0]/255.0
      green:pixel[1]/255.0 blue:pixel[2]/255.0
      alpha:pixel[3]/255.0];
  return color;
}

@end
