# used for tile map collision in walls

class HitBox:
    def __init__(self, right, top, left, bottom):
        self.right = right
        self.top = top
        self.left = left
        self.bottom = bottom

    def setHitBox(self, right, top, left, bottom):
        self.right = right
        self.top = top
        self.left = left
        self.bottom = bottom
